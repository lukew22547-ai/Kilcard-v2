import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/kilcard/AppShell";
import { useHistory } from "@/lib/kilcard/storage";
import { computeStats, formatToPar, generateInsights, type Insight } from "@/lib/kilcard/stats";
import type { Round } from "@/lib/kilcard/types";
import { getAIInsights } from "@/lib/api/golf-insights";

export const Route = createFileRoute("/summary")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : null,
  }),
  head: () => ({
    meta: [
      { title: "Round Summary — Kilcard" },
      { name: "description", content: "See your scoring stats and caddie insights for your latest round." },
      { property: "og:title", content: "Round Summary — Kilcard" },
      { property: "og:description", content: "See your scoring stats and caddie insights for your latest round." },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const history = useHistory();
  const [round, setRound] = useState<Round | null>(null);

  useEffect(() => {
    if (id) {
      const found = history.find((r) => r.id === id);
      if (found) setRound(found);
      return;
    }
    const raw = typeof window !== "undefined"
      ? sessionStorage.getItem("kilcard:last-finished")
      : null;
    if (raw) {
      try {
        setRound(JSON.parse(raw) as Round);
        return;
      } catch {
        /* fall through */
      }
    }
    if (history.length) setRound(history[0]);
  }, [history, id]);

  if (!round) {
    return (
      <AppShell>
        <div className="py-16 text-center">
          <p className="font-display text-3xl">No Round To Show</p>
          <p className="mt-2 text-sm text-navy/60">Finish a round to see your summary here.</p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-6 bg-navy px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-paper hover:bg-grass"
          >
            Back Home
          </button>
        </div>
      </AppShell>
    );
  }

  const stats = computeStats(round);
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    if (!round) return;
    const s = computeStats(round);
    getAIInsights({
      data: {
        holesPlayed: s.holesPlayed,
        totalScore: s.totalScore,
        toPar: s.toPar,
        avgPutts: s.avgPutts,
        fairwayHitPct: s.fairwayHitPct,
        fairwayAttempts: s.fairwayAttempts,
        fairwayMissLeft: s.fairwayMissLeft,
        fairwayMissRight: s.fairwayMissRight,
        fairwayMissOB: s.fairwayMissOB,
        girPct: s.girPct,
        girMissLeft: s.girMissLeft,
        girMissRight: s.girMissRight,
        girMissOB: s.girMissOB,
        penalties: s.penalties,
      },
    })
      .then((ai) => setInsights(ai ?? generateInsights(s)))
      .catch(() => setInsights(generateInsights(s)))
      .finally(() => setAiLoading(false));
  }, [round?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppShell>
      <section className="animate-reveal">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-grass">
          Round Complete
        </p>
        <h2 className="mt-1 font-display text-4xl tracking-tight">{round.course}</h2>
        <p className="mb-8 mt-1 font-mono text-xs text-navy/60">
          {new Date(round.date).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {" · "}
          {stats.holesPlayed} holes played
        </p>

        {/* Hero score */}
        <div className="mb-10 flex items-end justify-between border-y-2 border-navy/10 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
              Total Score
            </p>
            <p className="font-display text-7xl leading-none">{stats.totalScore}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
              To Par
            </p>
            <p
              className={
                "font-mono text-4xl font-bold " +
                (stats.toPar < 0 ? "text-grass" : stats.toPar === 0 ? "text-navy" : "text-destructive")
              }
            >
              {formatToPar(stats.toPar)}
            </p>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-px border border-navy/10 bg-navy/10">
          <StatBlock
            label="GIR %"
            value={`${Math.round(stats.girPct * 100)}%`}
            sub="Greens in regulation"
          />
          <StatBlock
            label="Avg Putts"
            value={stats.avgPutts.toFixed(2)}
            sub={`${stats.totalPutts} total`}
          />
          <StatBlock
            label="Fwy Hit"
            value={`${Math.round(stats.fairwayHitPct * 100)}%`}
            sub={`${stats.fairwayAttempts} attempts`}
          />
          <StatBlock
            label="Penalties"
            value={String(stats.penalties)}
            sub="Cost strokes"
          />
        </div>

        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em]">
            Caddie Insights
          </h3>
          {aiLoading && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-grass animate-pulse">
              AI analyzing…
            </span>
          )}
        </div>
        <div className="mb-12 space-y-3">
          {aiLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-sm bg-navy/10" />
            ))
          ) : (
            (insights ?? []).map((insight, i) => (
              <div
                key={i}
                className={
                  "rounded-2xl p-5 " +
                  (insight.tone === "focus"
                    ? "bg-navy text-paper"
                    : "bg-white text-navy ring-1 ring-navy/10")
                }
              >
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={
                      "size-2 rounded-full " +
                      (insight.tone === "focus"
                        ? "bg-grass"
                        : insight.tone === "win"
                        ? "bg-grass"
                        : "bg-navy/30")
                    }
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
                    {insight.tone === "focus"
                      ? "Focus Area"
                      : insight.tone === "win"
                      ? "Stat Win"
                      : "Note"}
                  </p>
                </div>
                <p className="font-display text-lg leading-tight">{insight.title}</p>
                <p
                  className={
                    "mt-2 text-sm leading-relaxed " +
                    (insight.tone === "focus" ? "text-paper/80" : "text-navy/70")
                  }
                >
                  {insight.body}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Hole-by-hole scorecard */}
        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]">
          Scorecard
        </h3>
        <div className="mb-12 overflow-x-auto bg-white p-4 ring-1 ring-navy/10">
          <Scorecard round={round} />
        </div>

        <div className="flex gap-2">
          <Link
            to="/"
            className="flex-1 border border-navy/15 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-navy/70 hover:bg-navy/5"
          >
            Home
          </Link>
          <Link
            to="/history"
            className="flex-1 bg-navy py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-paper hover:bg-grass"
          >
            View History
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-paper p-5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-navy/50">
        {label}
      </p>
      <p className="font-mono text-3xl font-bold">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-navy/40">
        {sub}
      </p>
    </div>
  );
}

function Scorecard({ round }: { round: Round }) {
  const is9 = round.holes.length === 9;
  const front = round.holes.slice(0, 9);
  const back = round.holes.slice(9);
  return (
    <div className="space-y-3 font-mono text-[10px]">
      <Nine label={is9 ? "9 Holes" : "Front"} holes={front} />
      {!is9 && <Nine label="Back" holes={back} />}
    </div>
  );
}

function Nine({ label, holes }: { label: string; holes: Round["holes"] }) {
  const total = holes.reduce((s, h) => s + (h.putts !== null || h.fairway !== null || h.gir !== null ? h.score : 0), 0);
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-navy/50">{label}</span>
        <span className="text-[10px] text-navy/70">· {total || "—"}</span>
      </div>
      <div className="grid grid-cols-9 gap-px bg-navy/10 ring-1 ring-navy/10">
        {holes.map((h) => (
          <div key={h.hole} className="bg-white p-1 text-center">
            <div className="text-[8px] text-navy/40">{h.hole}</div>
            <div className="font-bold">{h.putts !== null || h.fairway !== null || h.gir !== null ? h.score : "·"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}