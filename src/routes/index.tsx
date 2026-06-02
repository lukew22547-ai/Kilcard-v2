import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AppShell } from "@/components/kilcard/AppShell";
import { useActiveRound, useHistory } from "@/lib/kilcard/storage";
import { computeStats, formatToPar } from "@/lib/kilcard/stats";
import { makeRound } from "@/lib/kilcard/types";
import { type CourseInfo, searchCourses } from "@/lib/kilcard/courses";

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
  const history = useHistory();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CourseInfo | null>(null);
  const [showDrop, setShowDrop] = useState(false);
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  const [authReady, setAuthReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const last = history[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("kilcard:intro-seen")) {
      navigate({ to: "/intro" });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isGuest = localStorage.getItem("kilcard:guest") === "true";
      if (!user && !isGuest) {
        navigate({ to: "/auth" });
      } else {
        setAuthReady(true);
      }
    });
    return unsubscribe;
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

        {/* Last round */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/40">
            {last ? "Last Round" : "No Rounds Yet"}
          </p>
          {last ? (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl uppercase leading-tight">{last.course}</p>
                  <p className="text-[12px] text-navy/40">
                    {new Date(last.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                {(() => {
                  const s = computeStats(last);
                  return (
                    <div className="text-right">
                      <p className="font-mono text-2xl font-bold">{formatToPar(s.toPar)}</p>
                      <p className="text-[10px] font-bold uppercase text-grass">{s.totalScore} total</p>
                    </div>
                  );
                })()}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-navy/8 pt-4">
                {(() => {
                  const s = computeStats(last);
                  return (
                    <>
                      <StatCell label="GIR" value={`${Math.round(s.girPct * 100)}%`} />
                      <StatCell label="Putts" value={s.avgPutts.toFixed(1)} />
                      <StatCell label="Fwy" value={`${Math.round(s.fairwayHitPct * 100)}%`} />
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-navy/8">
              <p className="text-[14px] text-navy/40 leading-relaxed">
                Your finished rounds will appear here with full stats and caddie insights.
              </p>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-navy/40">{label}</p>
      <p className="font-mono text-[15px] font-bold text-navy">{value}</p>
    </div>
  );
}
