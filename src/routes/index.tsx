import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
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
      { property: "og:title", content: "Kilcard — Track. Analyze. Improve." },
      { property: "og:description", content: "A minimal golf performance tracker. Log each hole in seconds and get clear, actionable insights to improve your game." },
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
  const inputRef = useRef<HTMLInputElement>(null);
  const last = history[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("kilcard:intro-seen")) {
        navigate({ to: "/intro" });
      } else if (!localStorage.getItem("kilcard:session")) {
        navigate({ to: "/auth" });
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const suggestions = searchCourses(query);

  function pickCourse(c: CourseInfo) {
    setSelected(c);
    setQuery(c.name);
    setHoleCount(c.holes);
    setShowDrop(false);
    inputRef.current?.blur();
  }

  function clearSelection() {
    setSelected(null);
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
      <section className="animate-reveal">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-grass">
              Kilcard / Performance
            </p>
            <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight text-balance">
              Ready for<br />the first tee?
            </h1>
          </div>
        </div>

        {active ? (
          <ActiveRoundCard
            holesPlayed={computeStats(active).holesPlayed}
            totalHoles={active.holes.length}
            course={active.course}
            onResume={() => navigate({ to: "/round" })}
            onDiscard={() => setActive(null)}
          />
        ) : (
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
              Holes
            </label>
            <div className="flex">
              {([9, 18] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setHoleCount(n)}
                  className={
                    "flex-1 py-3 text-sm font-bold uppercase tracking-[0.25em] transition-colors " +
                    (holeCount === n
                      ? "bg-navy text-paper"
                      : "border border-navy/15 text-navy/60 hover:bg-navy/5")
                  }
                >
                  {n} Holes
                </button>
              ))}
            </div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
              Course
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  clearSelection();
                  setShowDrop(true);
                }}
                onFocus={() => setShowDrop(true)}
                onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                maxLength={60}
                placeholder="Search Arkansas courses…"
                className="w-full border border-navy/15 bg-white px-4 py-4 text-sm font-medium text-navy placeholder:text-navy/30 focus:border-grass focus:outline-none"
              />
              {selected && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-grass px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-paper">
                  Par {selected.pars.reduce((a, b) => a + b, 0)} · {selected.holes}h
                </span>
              )}
              {showDrop && suggestions.length > 0 && (
                <div className="absolute z-20 w-full overflow-hidden rounded-b-xl border border-t-0 border-navy/15 bg-white shadow-lg">
                  {suggestions.map((c) => (
                    <button
                      key={c.id}
                      onMouseDown={() => pickCourse(c)}
                      onTouchStart={() => pickCourse(c)}
                      className="flex w-full items-center justify-between border-b border-navy/5 px-4 py-3 text-left last:border-0 hover:bg-navy/5"
                    >
                      <div>
                        <p className="text-sm font-medium text-navy">{c.name}</p>
                        <p className="text-xs text-navy/50">{c.city}, AR</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-grass/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-grass">
                        Par {c.pars.reduce((a, b) => a + b, 0)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={startRound}
              className="w-full bg-navy py-5 text-sm font-bold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-grass"
            >
              Start New Round
            </button>
          </div>
        )}

        <div className="mt-12 border-t-2 border-navy/10 pt-6">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]">
            {last ? "Last Round Summary" : "No rounds yet"}
          </h2>
          {last ? (
            <LastRoundCard
              course={last.course}
              date={new Date(last.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              {...(() => {
                const s = computeStats(last);
                return {
                  toPar: formatToPar(s.toPar),
                  total: s.totalScore,
                  gir: Math.round(s.girPct * 100),
                  putts: s.avgPutts.toFixed(1),
                  fwy: Math.round(s.fairwayHitPct * 100),
                };
              })()}
            />
          ) : (
            <p className="text-sm leading-relaxed text-navy/50">
              Your finished rounds will appear here with full stats and caddie insights.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function ActiveRoundCard({
  holesPlayed,
  totalHoles,
  course,
  onResume,
  onDiscard,
}: {
  holesPlayed: number;
  totalHoles: number;
  course: string;
  onResume: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="bg-white p-5 ring-1 ring-navy/10">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-grass">
        Round In Progress
      </p>
      <p className="mt-1 font-display text-2xl">{course}</p>
      <p className="text-xs text-navy/60">
        {holesPlayed} of {totalHoles} holes logged
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onResume}
          className="flex-1 bg-navy py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-paper hover:bg-grass"
        >
          Resume Round
        </button>
        <button
          onClick={onDiscard}
          className="border border-navy/15 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-navy/60 hover:bg-navy/5"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

function LastRoundCard(props: {
  course: string;
  date: string;
  toPar: string;
  total: number;
  gir: number;
  putts: string;
  fwy: number;
}) {
  return (
    <div className="bg-white p-5 ring-1 ring-navy/10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="font-display text-2xl">{props.course}</p>
          <p className="text-xs text-navy/60">{props.date}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold">{props.toPar}</p>
          <p className="text-[10px] font-bold uppercase text-grass">
            {props.total} Total
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-navy/10 pt-4">
        <Stat label="GIR" value={`${props.gir}%`} />
        <Stat label="Putts" value={props.putts} />
        <Stat label="Fwy" value={`${props.fwy}%`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[9px] font-bold uppercase text-navy/60">{label}</p>
      <p className="font-mono text-sm">{value}</p>
    </div>
  );
}
