import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/kilcard/AppShell";
import { useHistory } from "@/lib/kilcard/storage";
import { computeStats, formatToPar, generateInsights, type Insight } from "@/lib/kilcard/stats";
import type { Round } from "@/lib/kilcard/types";
import { getAIInsights } from "@/lib/api/golf-insights";
import { getProStatus } from "@/lib/kilcard/pro";
import { Cell, Pie, PieChart } from "recharts";

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
      try { setRound(JSON.parse(raw) as Round); return; } catch { /* fall through */ }
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
            className="mt-6 rounded-xl bg-navy px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-paper hover:bg-grass"
          >
            Back Home
          </button>
        </div>
      </AppShell>
    );
  }

  return <SummaryContent round={round} />;
}

function SummaryContent({ round }: { round: Round }) {
  const stats = computeStats(round);
  const freeInsights = generateInsights(stats);
  const [isPro] = useState(() => getProStatus());
  const [aiInsights, setAiInsights] = useState<Insight[] | null>(null);
  const [aiLoading, setAiLoading] = useState(isPro);

  useEffect(() => {
    if (!isPro) return;
    getAIInsights({
      data: {
        holesPlayed: stats.holesPlayed,
        totalScore: stats.totalScore,
        toPar: stats.toPar,
        avgPutts: stats.avgPutts,
        fairwayHitPct: stats.fairwayHitPct,
        fairwayAttempts: stats.fairwayAttempts,
        fairwayMissLeft: stats.fairwayMissLeft,
        fairwayMissRight: stats.fairwayMissRight,
        fairwayMissOB: stats.fairwayMissOB,
        girPct: stats.girPct,
        girMissLeft: stats.girMissLeft,
        girMissRight: stats.girMissRight,
        girMissOB: stats.girMissOB,
        penalties: stats.penalties,
      },
    })
      .then((ai) => setAiInsights(ai ?? null))
      .catch(() => {})
      .finally(() => setAiLoading(false));
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const stripeLink = (import.meta.env.VITE_STRIPE_LINK as string | undefined) ?? "#";

  return (
    <AppShell>
      <section className="animate-reveal">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-grass">Round Complete</p>
        <h2 className="mt-1 font-display text-4xl tracking-tight">{round.course}</h2>
        <p className="mb-8 mt-1 font-mono text-xs text-navy/60">
          {new Date(round.date).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          {" · "}
          {stats.holesPlayed} holes played
        </p>

        {/* Hero score */}
        <div className="mb-10 flex items-end justify-between border-y-2 border-navy/10 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">Total Score</p>
            <p className="font-display text-7xl leading-none">{stats.totalScore}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">To Par</p>
            <p className={"font-mono text-4xl font-bold " + (stats.toPar < 0 ? "text-grass" : stats.toPar === 0 ? "text-navy" : "text-destructive")}>
              {formatToPar(stats.toPar)}
            </p>
          </div>
        </div>

        {/* Stat pie charts */}
        <div className="mb-10 grid grid-cols-2 gap-3">
          <PieStat
            label="GIR"
            value={`${Math.round(stats.girPct * 100)}%`}
            sub="Greens in Reg"
            segments={
              stats.holesPlayed < 1
                ? [{ value: 1, color: "#e2e8f0" }]
                : [
                    { value: stats.girPct, color: "#16a34a" },
                    { value: 1 - stats.girPct, color: "#e2e8f0" },
                  ]
            }
            valueColor="#16a34a"
          />
          <PieStat
            label="Avg Putts"
            value={stats.avgPutts > 0 ? stats.avgPutts.toFixed(2) : "—"}
            sub={`${stats.totalPutts} total`}
            segments={
              stats.avgPutts === 0
                ? [{ value: 1, color: "#e2e8f0" }]
                : [
                    { value: Math.min(stats.avgPutts / 3, 1), color: puttColor(stats.avgPutts) },
                    { value: Math.max(0, 1 - stats.avgPutts / 3), color: "#e2e8f0" },
                  ]
            }
            valueColor={puttColor(stats.avgPutts)}
          />
          <PieStat
            label="Fairway"
            value={stats.fairwayAttempts > 0 ? `${Math.round(stats.fairwayHitPct * 100)}%` : "—"}
            sub={`${stats.fairwayAttempts} attempts`}
            segments={
              stats.fairwayAttempts === 0
                ? [{ value: 1, color: "#e2e8f0" }]
                : [
                    { value: stats.fairwayHitPct, color: "#2563eb" },
                    { value: 1 - stats.fairwayHitPct, color: "#e2e8f0" },
                  ]
            }
            valueColor="#2563eb"
          />
          <PieStat
            label="Penalties"
            value={String(stats.penalties)}
            sub="Strokes lost"
            segments={
              stats.penalties === 0
                ? [{ value: 1, color: "#16a34a" }]
                : [
                    { value: Math.min(stats.penalties / 9, 1), color: "#dc2626" },
                    { value: Math.max(0, 1 - stats.penalties / 9), color: "#e2e8f0" },
                  ]
            }
            valueColor={stats.penalties === 0 ? "#16a34a" : "#dc2626"}
          />
        </div>

        {/* ── FREE: Round Insights ───────────────────────────────────────── */}
        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]">Round Insights</h3>
        <div className="mb-10 space-y-3">
          {freeInsights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>

        {/* ── PRO: AI Caddie ─────────────────────────────────────────────── */}
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em]">AI Caddie</h3>
          {isPro && (
            <span className="rounded-full bg-grass px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-paper">
              Pro
            </span>
          )}
        </div>

        {isPro ? (
          <div className="mb-12 space-y-3">
            {aiLoading ? (
              <>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-grass animate-pulse">
                  AI analyzing your round…
                </p>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-navy/10" />
                ))}
              </>
            ) : aiInsights ? (
              aiInsights.map((insight, i) => <InsightCard key={i} insight={insight} />)
            ) : (
              <p className="text-sm text-navy/50">AI insights unavailable for this round.</p>
            )}
          </div>
        ) : (
          <div className="mb-12">
            <div className="rounded-2xl border-2 border-dashed border-navy/15 p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-display text-2xl leading-tight">Unlock AI Caddie</p>
                  <p className="mt-1 text-sm text-navy/60">
                    Personalized insights powered by Claude AI
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-grass px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-paper">
                  Pro
                </span>
              </div>
              <ul className="mb-6 space-y-2">
                {[
                  "Directional miss analysis — left, right, or OB patterns",
                  "Specific practice drills based on your data",
                  "Personalized advice after every round",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy/70">
                    <span className="mt-0.5 shrink-0 text-grass">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={stripeLink}
                className="block w-full rounded-xl bg-navy py-4 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-grass touch-manipulation"
              >
                Upgrade to AI Caddie
              </a>
            </div>
          </div>
        )}

        {/* Scorecard */}
        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]">Scorecard</h3>
        <div className="mb-12 overflow-x-auto bg-white p-4 ring-1 ring-navy/10">
          <Scorecard round={round} />
        </div>

        <div className="flex gap-2">
          <Link to="/" className="flex-1 rounded-xl border border-navy/15 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-navy/70 hover:bg-navy/5">
            Home
          </Link>
          <Link to="/history" className="flex-1 rounded-xl bg-navy py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-paper hover:bg-grass">
            View History
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className={"rounded-2xl p-5 " + (insight.tone === "focus" ? "bg-navy text-paper" : "bg-white text-navy ring-1 ring-navy/10")}>
      <div className="mb-2 flex items-center gap-3">
        <span className={"size-2 rounded-full " + (insight.tone === "focus" ? "bg-grass" : insight.tone === "win" ? "bg-grass" : "bg-navy/30")} />
        <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
          {insight.tone === "focus" ? "Focus Area" : insight.tone === "win" ? "Stat Win" : "Note"}
        </p>
      </div>
      <p className="font-display text-lg leading-tight">{insight.title}</p>
      <p className={"mt-2 text-sm leading-relaxed " + (insight.tone === "focus" ? "text-paper/80" : "text-navy/70")}>
        {insight.body}
      </p>
    </div>
  );
}

function puttColor(avg: number): string {
  if (avg <= 1.9) return "#16a34a";
  if (avg <= 2.2) return "#f59e0b";
  return "#dc2626";
}

function PieStat({
  label,
  value,
  sub,
  segments,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  segments: Array<{ value: number; color: string }>;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-4 ring-1 ring-navy/10">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-navy/50">{label}</p>
      <div className="relative">
        <PieChart width={110} height={110}>
          <Pie
            data={segments}
            cx={55}
            cy={55}
            innerRadius={34}
            outerRadius={50}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            paddingAngle={segments.length > 1 ? 2 : 0}
          >
            {segments.map((s, i) => (
              <Cell key={i} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono text-base font-bold"
            style={{ color: valueColor ?? "#1e3a5f" }}
          >
            {value}
          </span>
        </div>
      </div>
      <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-wider text-navy/40">{sub}</p>
    </div>
  );
}

function Scorecard({ round }: { round: Round }) {
  const is9 = round.holes.length === 9;
  return (
    <div className="space-y-3 font-mono text-[10px]">
      <Nine label={is9 ? "9 Holes" : "Front"} holes={round.holes.slice(0, 9)} />
      {!is9 && <Nine label="Back" holes={round.holes.slice(9)} />}
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
