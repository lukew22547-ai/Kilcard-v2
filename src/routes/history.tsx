import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/kilcard/AppShell";
import { useHistory } from "@/lib/kilcard/storage";
import { computeStats, formatToPar } from "@/lib/kilcard/stats";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Round History — Kilcard" },
      { name: "description", content: "Browse every round you've logged with Kilcard." },
      { property: "og:title", content: "Round History — Kilcard" },
      { property: "og:description", content: "Browse every round you've logged with Kilcard." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const history = useHistory();

  return (
    <AppShell>
      <section className="animate-reveal">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-grass">
          Archive
        </p>
        <h1 className="mb-8 mt-1 font-display text-5xl uppercase leading-none tracking-tight">
          Round History
        </h1>

        {history.length === 0 ? (
          <div className="bg-white p-8 text-center ring-1 ring-navy/10">
            <p className="font-display text-2xl">Nothing logged yet</p>
            <p className="mt-2 text-sm text-navy/60">
              Finished rounds will live here. Start one from the home screen.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block bg-navy px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-paper hover:bg-grass"
            >
              Start a Round
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((r) => {
              const s = computeStats(r);
              return (
                <Link
                  key={r.id}
                  to="/summary"
                  search={{ id: r.id }}
                  className="grid grid-cols-[1fr_auto] items-start gap-4 bg-white p-5 ring-1 ring-navy/10 transition-shadow hover:ring-navy/30"
                >
                  <div>
                    <p className="font-display text-xl leading-tight">{r.course}</p>
                    <p className="font-mono text-[10px] uppercase text-navy/50">
                      {new Date(r.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" · "}
                      {s.holesPlayed} holes
                    </p>
                    <div className="mt-3 flex gap-4 font-mono text-[11px]">
                      <span>
                        <span className="text-navy/50">GIR </span>
                        {Math.round(s.girPct * 100)}%
                      </span>
                      <span>
                        <span className="text-navy/50">Putts </span>
                        {s.avgPutts.toFixed(1)}
                      </span>
                      <span>
                        <span className="text-navy/50">Fwy </span>
                        {Math.round(s.fairwayHitPct * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-bold">
                      {formatToPar(s.toPar)}
                    </p>
                    <p className="text-[10px] font-bold uppercase text-grass">
                      {s.totalScore}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}