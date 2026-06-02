import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AppShell } from "@/components/kilcard/AppShell";
import { useActiveRound } from "@/lib/kilcard/storage";
import { computeStats } from "@/lib/kilcard/stats";
import { makeRound } from "@/lib/kilcard/types";
import { type CourseInfo, searchCourses } from "@/lib/kilcard/courses";

// Write intro-seen to both localStorage and a long-lived cookie.
// iOS Safari can clear localStorage on force-quit; cookies survive.
function stampIntroSeen() {
  localStorage.setItem("kilcard:intro-seen", "true");
  document.cookie = "kc_intro=1; max-age=31536000; path=/; SameSite=Lax";
}

function hasSeenIntro(): boolean {
  return (
    localStorage.getItem("kilcard:intro-seen") === "true" ||
    document.cookie.includes("kc_intro=1")
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kilcard — Track. Analyze. Improve." },
      { name: "description", content: "A minimal golf performance tracker. Log each hole in seconds and get clear, actionable insights to improve your game." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [active, setActive] = useActiveRound();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CourseInfo | null>(null);
  const [showDrop, setShowDrop] = useState(false);
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  const [authReady, setAuthReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    let initialResolved = false;

    // auth.authStateReady() waits until Firebase has fully restored the session
    // from ALL persistence layers (localStorage + IndexedDB). This is the correct
    // fix for iOS Safari, which is slow to restore IndexedDB after a force quit
    // and would otherwise fire onAuthStateChanged with null prematurely.
    auth.authStateReady().then(() => {
      if (cancelled) return;
      initialResolved = true;

      const user  = auth.currentUser;
      const isGuest = localStorage.getItem("kilcard:guest") === "true";

      if (user) {
        stampIntroSeen();
        setAuthReady(true);
      } else if (isGuest) {
        setAuthReady(true);
      } else {
        navigate({ to: hasSeenIntro() ? "/auth" : "/intro" });
      }
    });

    // Ongoing listener — only acts after the initial resolution so it never
    // interferes with authStateReady's determination on startup / refresh.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (cancelled || !initialResolved) return;
      const isGuest = localStorage.getItem("kilcard:guest") === "true";
      if (!user && !isGuest) {
        setAuthReady(false);
        navigate({ to: "/auth" });
      } else if (user || isGuest) {
        setAuthReady(true);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!authReady) return null;

  const suggestions = searchCourses(query);

  function pickCourse(c: CourseInfo) {
    setSelected(c);
    setQuery(c.name);
    setHoleCount(c.holes);
    setShowDrop(false);
    inputRef.current?.blur();
  }

  function startRound() {
    const name = query.trim() || "Untitled Course";
    const count = selected?.holes ?? holeCount;
    const round = makeRound(name, count, selected?.pars);
    setActive(round);
    setQuery("");
    setSelected(null);
    navigate({ to: "/round" });
  }

  return (
    <AppShell>
      <div className="animate-reveal space-y-6">

        {/* Page title */}
        <div>
          <h1 className="font-display text-[42px] uppercase leading-none tracking-tight">
            {active ? "Round in\nProgress" : "Ready to\nPlay?"}
          </h1>
          <p className="mt-2 text-[15px] text-navy/50">
            {active
              ? "You have an active round. Resume or discard it below."
              : "Start a new round and track every hole."}
          </p>
        </div>

        {/* Active round */}
        {active ? (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-grass">
              Round In Progress
            </p>
            <p className="mt-1 font-display text-2xl uppercase leading-tight">{active.course}</p>
            <p className="text-[13px] text-navy/50">
              {computeStats(active).holesPlayed} of {active.holes.length} holes logged
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigate({ to: "/round" })}
                className="flex-1 rounded-xl bg-navy py-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-paper transition-all hover:bg-grass active:scale-[0.98]"
              >
                Resume Round
              </button>
              <button
                onClick={() => setActive(null)}
                className="rounded-xl border border-navy/15 px-4 py-3 text-[12px] font-semibold text-navy/50 transition-all hover:bg-navy/5 active:scale-[0.98]"
              >
                Discard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Hole count — segmented control */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/40">
                Holes
              </p>
              <div className="flex rounded-[14px] bg-navy/10 p-[3px]">
                {([9, 18] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setHoleCount(n)}
                    className={
                      "flex-1 rounded-[11px] py-2.5 text-[13px] font-semibold transition-all duration-200 " +
                      (holeCount === n
                        ? "bg-white text-navy shadow-sm"
                        : "text-navy/40 hover:text-navy/60")
                    }
                  >
                    {n} Holes
                  </button>
                ))}
              </div>
            </div>

            {/* Course search */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/40">
                Course
              </p>
              <div className="relative">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(null); setShowDrop(true); }}
                  onFocus={() => setShowDrop(true)}
                  onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                  maxLength={60}
                  placeholder="Search Arkansas courses…"
                  className="w-full rounded-2xl bg-white px-5 py-4 text-[15px] font-medium text-navy shadow-sm ring-1 ring-navy/10 placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-grass/30 transition-all"
                />
                {selected && (
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-grass/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-grass">
                    Par {selected.pars.reduce((a, b) => a + b, 0)} · {selected.holes}h
                  </span>
                )}
                {showDrop && suggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-navy/10">
                    {suggestions.map((c) => (
                      <button
                        key={c.id}
                        onMouseDown={() => pickCourse(c)}
                        onTouchStart={() => pickCourse(c)}
                        className="flex w-full items-center justify-between border-b border-navy/5 px-5 py-3.5 text-left last:border-0 hover:bg-navy/5 transition-colors"
                      >
                        <div>
                          <p className="text-[14px] font-semibold text-navy">{c.name}</p>
                          <p className="text-[12px] text-navy/40">{c.city}, AR</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-grass/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-grass">
                          Par {c.pars.reduce((a, b) => a + b, 0)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={startRound}
              className="w-full rounded-2xl bg-grass py-[15px] text-[15px] font-semibold text-paper shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              Start New Round
            </button>
          </div>
        )}

        {/* Friends / Social */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/40">
            Friends &amp; Social
          </p>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/8">
            <div className="flex flex-col items-center text-center gap-3">
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-navy/30">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-navy">Friends &amp; Social</p>
                <p className="mt-1 text-[13px] text-navy/40">Under Maintenance</p>
              </div>
              {/* Pulsing status */}
              <div className="flex items-center gap-2 rounded-xl bg-navy/5 px-4 py-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grass opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-grass" />
                </span>
                <p className="text-[12px] font-semibold text-navy/50">We're working on it</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

