import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/kilcard/AppShell";
import { useActiveRound, useHistory } from "@/lib/kilcard/storage";
import { computeStats, formatToPar } from "@/lib/kilcard/stats";
import { makeRound } from "@/lib/kilcard/types";

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
  const [course, setCourse] = useState("");
  const last = history[0];

  function startRound() {
    const round = makeRound(course || "Untitled Course");
    setActive(round);
    setCourse("");
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
            course={active.course}
            onResume={() => navigate({ to: "/round" })}
            onDiscard={() => setActive(null)}
          />
        ) : (
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
              Course
            </label>
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              maxLength={60}
              placeholder="St Andrews / Old"
              className="w-full border border-navy/15 bg-white px-4 py-4 text-sm font-medium text-navy placeholder:text-navy/30 focus:border-grass focus:outline-none"
            />
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
  course,
  onResume,
  onDiscard,
}: {
  holesPlayed: number;
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
        {holesPlayed} of 18 holes logged
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
