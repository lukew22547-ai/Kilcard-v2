import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
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

function IntroPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    localStorage.setItem("kilcard:intro-seen", "true");
  }, []);

  function enterApp() {
    navigate({ to: "/auth" });
  }

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

  return (
    <div className="flex h-screen flex-col bg-paper text-navy">
      {/* Header */}
      <header className="shrink-0 border-b border-navy/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
          <Link to="/intro" className="flex items-center">
            <img src={kilcardLogo} alt="Kilcard" className="h-14 w-auto mix-blend-multiply" />
          </Link>
        </div>
      </header>

      {/* Slide container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {/* Slide 1 — Welcome */}
          <div className="w-full shrink-0 overflow-y-auto">
            <div className="mx-auto max-w-md space-y-6 px-6 pb-12 pt-8">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-grass">
                  Kilcard / Welcome
                </p>
                <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight text-balance">
                  Welcome to<br />KilCard
                </h1>
              </div>

              <p className="text-lg leading-relaxed text-navy/80">
                This is where your game starts.
              </p>

              <p className="text-sm leading-relaxed text-navy/60">
                KilCard makes it simple to track your golf rounds and stats — giving you a clear picture of how you actually play. From scores to fairways hit, greens, and putts, everything is organized in one place so you can see your progress over time.
              </p>

              <div className="border-t-2 border-navy/10 pt-6">
                <p className="mb-4 font-display text-2xl uppercase leading-tight">
                  This is just the beginning.
                </p>
                <p className="text-sm leading-relaxed text-navy/60">
                  Once you’re in, you’ll be able to log rounds, review your stats, and start understanding what’s really holding your game back.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  "Track every round",
                  "See your stats instantly",
                  "Build your golf history over time",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center bg-grass text-paper">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={goNext}
                className="w-full bg-navy py-5 text-sm font-bold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-grass"
              >
                Next — Caddie AI
              </button>
            </div>
          </div>

          {/* Slide 2 — Caddie AI Preview */}
          <div className="w-full shrink-0 overflow-y-auto">
            <div className="mx-auto max-w-md space-y-6 px-6 pb-12 pt-8">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-grass">
                  Caddie AI / Preview
                </p>
                <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight text-balance">
                  Your Caddie AI<br />Preview
                </h2>
              </div>

              <p className="text-sm leading-relaxed text-navy/60">
                KilCard comes with something extra — your personal Caddie AI.
              </p>

              <p className="text-sm leading-relaxed text-navy/60">
                This is just a preview of what’s inside.
              </p>

              <p className="text-sm leading-relaxed text-navy/60">
                As you track rounds, your Caddie AI will analyze your stats and help guide your improvement. It turns your data into simple, actionable feedback so you know exactly what to work on.
              </p>

              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
                  Inside the app, it will:
                </p>
                <ul className="space-y-3">
                  {[
                    "Break down your performance",
                    "Highlight where you’re losing strokes",
                    "Suggest drills based on your stats",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="grid size-6 place-items-center bg-grass text-paper">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-navy p-6 text-paper">
                <p className="font-display text-2xl uppercase leading-tight">
                  No guessing. No wasted practice.
                </p>
                <p className="mt-2 text-sm opacity-70">
                  Just smarter improvement — built around your game.
                </p>
              </div>

              <button
                onClick={enterApp}
                className="w-full bg-grass py-5 text-sm font-bold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-navy"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="shrink-0 border-t border-navy/10 bg-paper">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
          <button
            onClick={goPrev}
            disabled={slide === 0}
            className="grid size-9 place-items-center border border-navy/15 text-navy/70 transition-colors disabled:opacity-30 hover:bg-navy/5"
            aria-label="Previous slide"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={
                  "h-2 rounded-full transition-all " +
                  (slide === i ? "w-6 bg-navy" : "w-2 bg-navy/20 hover:bg-navy/40")
                }
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={slide === 1 ? enterApp : goNext}
            className="grid size-9 place-items-center border border-navy/15 text-navy/70 transition-colors hover:bg-navy/5"
            aria-label={slide === 1 ? "Get started" : "Next slide"}
          >
            {slide === 1 ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M7 2L12 7L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        <div className="mx-auto max-w-md px-6 pb-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-navy/30">
          Track · Analyze · Improve
        </div>
      </div>
    </div>
  );
}
