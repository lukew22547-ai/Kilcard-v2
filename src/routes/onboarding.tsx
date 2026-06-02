import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { markOnboarded } from "@/lib/kilcard/onboarding";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const SLIDES = [
  {
    bg: "from-[#0d1829] to-[#1a2f4e]",
    accent: "#22c55e",
    icon: "⛳",
    eyebrow: "Welcome to Kilcard",
    heading: "Track Every\nRound You Play",
    description:
      "Stop trying to remember how you played. Log every hole in seconds and build a complete picture of your game over time.",
    features: [
      { icon: "📋", text: "Score, putts, fairways & GIR logged hole by hole" },
      { icon: "📊", text: "Round stats with visual charts after every round" },
      { icon: "📍", text: "63 Arkansas courses with auto hole-by-hole par" },
      { icon: "🕓", text: "Full round history saved to your device" },
    ],
  },
  {
    bg: "from-[#0a2010] to-[#1a3d20]",
    accent: "#4ade80",
    icon: "🤖",
    eyebrow: "AI Caddie",
    heading: "AI That Actually\nImproves Your Game",
    description:
      "After every round, your personal AI caddie analyzes your stats and gives you specific, actionable advice — not generic tips.",
    features: [
      { icon: "🎯", text: "Detects if you miss fairways or greens left, right, or OB" },
      { icon: "💡", text: "Explains the likely swing cause behind each miss pattern" },
      { icon: "🏋️", text: "Prescribes specific practice drills tailored to your data" },
      { icon: "📈", text: "Gets smarter the more rounds you log" },
    ],
  },
] as const;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  function advance() {
    if (animating) return;
    if (isLast) {
      markOnboarded();
      navigate({ to: "/" });
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setSlide((s) => s + 1);
      setAnimating(false);
    }, 200);
  }

  function skip() {
    markOnboarded();
    navigate({ to: "/" });
  }

  return (
    <div
      className={`flex h-dvh flex-col bg-gradient-to-br ${current.bg} text-white transition-all duration-500`}
      style={{ opacity: animating ? 0 : 1, transition: "opacity 0.2s ease" }}
    >
      {/* Skip */}
      <div className="flex justify-end px-6 pt-6">
        <button
          onClick={skip}
          className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 touch-manipulation"
        >
          Skip
        </button>
      </div>

      {/* Icon */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div
          className="mb-8 flex size-28 items-center justify-center rounded-3xl text-6xl shadow-2xl"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          {current.icon}
        </div>

        <p
          className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: current.accent }}
        >
          {current.eyebrow}
        </p>

        <h1 className="mb-4 font-display text-5xl leading-[0.95] tracking-tight" style={{ whiteSpace: "pre-line" }}>
          {current.heading}
        </h1>

        <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/60">
          {current.description}
        </p>

        {/* Features */}
        <div className="w-full max-w-xs space-y-3 text-left">
          {current.features.map((f) => (
            <div key={f.text} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-lg leading-none">{f.icon}</span>
              <p className="text-sm leading-snug text-white/75">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-10 space-y-5">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 24 : 8,
                height: 8,
                background: i === slide ? current.accent : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={advance}
          className="w-full rounded-2xl py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-lg transition-all touch-manipulation active:scale-95"
          style={{ background: current.accent, color: "#0d1829" }}
        >
          {isLast ? "Start Tracking" : "Next"}
        </button>
      </div>
    </div>
  );
}
