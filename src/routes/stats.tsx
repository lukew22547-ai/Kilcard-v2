import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/kilcard/AppShell";
import { useHistory } from "@/lib/kilcard/storage";
import { computeStats, formatToPar } from "@/lib/kilcard/stats";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Your Stats — Kilcard" },
      { name: "description", content: "Your overall golf performance stats across all tracked rounds." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const history = useHistory();
  const hasRounds = history.length > 0;

  const allStats = history.map((r) => computeStats(r));

  const totalRounds = history.length;
  const avgToPar   = hasRounds ? allStats.reduce((s, r) => s + r.toPar, 0) / totalRounds : null;
  const avgScore   = hasRounds ? allStats.reduce((s, r) => s + r.totalScore, 0) / totalRounds : null;
  const avgGIR     = hasRounds ? allStats.reduce((s, r) => s + r.girPct, 0) / totalRounds : null;
  const avgPutts   = hasRounds ? allStats.reduce((s, r) => s + r.avgPutts, 0) / totalRounds : null;
  const avgFwy     = hasRounds ? allStats.reduce((s, r) => s + r.fairwayHitPct, 0) / totalRounds : null;
  const bestToPar  = hasRounds ? Math.min(...allStats.map((r) => r.toPar)) : null;
  const bestRound  = hasRounds ? history[allStats.indexOf(allStats.find((r) => r.toPar === bestToPar)!)] : null;

  return (
    <AppShell>
      <div className="animate-reveal space-y-6">

        <div>
          <h1 className="font-display text-[42px] uppercase leading-none tracking-tight">
            Your Stats
          </h1>
          <p className="mt-2 text-[15px] text-navy/50">
            {hasRounds
              ? `Across ${totalRounds} round${totalRounds === 1 ? "" : "s"}`
              : "Play a round to see your stats here"}
          </p>
        </div>

        {!hasRounds ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-navy/8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy/5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/30">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            </div>
            <p className="font-display text-xl uppercase">No data yet</p>
            <p className="mt-2 text-[14px] text-navy/45">
              Complete a round from the Round tab to start building your stats.
            </p>
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className="rounded-2xl bg-navy p-5 text-paper">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/50">
                Average Score
              </p>
              <p className="mt-1 font-display text-5xl uppercase leading-none tracking-tight">
                {avgToPar! >= 0 ? "+" : ""}{avgToPar!.toFixed(1)}
              </p>
              <p className="mt-1 text-[13px] text-paper/50">
                {avgScore!.toFixed(1)} avg total · {totalRounds} rounds
              </p>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Avg GIR"
                value={`${Math.round(avgGIR! * 100)}%`}
                sub="Greens in regulation"
              />
              <StatCard
                label="Avg Putts"
                value={avgPutts!.toFixed(1)}
                sub="Per hole"
              />
              <StatCard
                label="Avg Fairways"
                value={`${Math.round(avgFwy! * 100)}%`}
                sub="Fairways hit"
              />
              <StatCard
                label="Rounds"
                value={String(totalRounds)}
                sub="Logged total"
              />
            </div>

            {/* Best round */}
            {bestRound && (
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/40">
                  Best Round
                </p>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xl uppercase leading-tight">{bestRound.course}</p>
                      <p className="mt-0.5 text-[12px] text-navy/40">
                        {new Date(bestRound.date).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-2xl font-bold">{formatToPar(bestToPar!)}</p>
                      <p className="text-[10px] font-bold uppercase text-grass">Personal best</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </AppShell>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/40">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-navy">{value}</p>
      <p className="mt-0.5 text-[11px] text-navy/40">{sub}</p>
    </div>
  );
}
