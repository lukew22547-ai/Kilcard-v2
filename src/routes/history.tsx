import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/kilcard/AppShell";
import { useHistory } from "@/lib/kilcard/storage";
import { computeStats, formatToPar } from "@/lib/kilcard/stats";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Round History — Kilcard" },
      { name: "description", content: "Browse every round you've logged with Kilcard." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const history = useHistory();

  return (
    <AppShell>
      <div className="animate-reveal space-y-5">

        <div>
          <h1 className="font-display text-[42px] uppercase leading-none tracking-tight">
            Past Rounds
          </h1>
          <p className="mt-2 text-[15px] text-navy/50">
            {history.length > 0
              ? `${history.length} round${history.length === 1 ? "" : "s"} logged`
              : "No rounds logged yet"}
          </p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-navy/8">
            <p className="font-display text-2xl uppercase">Nothing logged yet</p>
            <p className="mt-2 text-[14px] text-navy/50">
              Finished rounds will appear here. Start one from the Round tab.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-xl bg-grass px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-paper transition-all hover:shadow-md active:scale-[0.98]"
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
                  className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/8 transition-all hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-xl uppercase leading-tight truncate">{r.course}</p>
                      <p className="mt-0.5 text-[12px] text-navy/40">
                        {new Date(r.date).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                        {" · "}{s.holesPlayed} holes
                      </p>
                      <div className="mt-3 flex gap-4 font-mono text-[12px] text-navy">
                        <span><span className="text-navy/40">GIR </span>{Math.round(s.girPct * 100)}%</span>
                        <span><span className="text-navy/40">Putts </span>{s.avgPutts.toFixed(1)}</span>
                        <span><span className="text-navy/40">Fwy </span>{Math.round(s.fairwayHitPct * 100)}%</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-2xl font-bold">{formatToPar(s.toPar)}</p>
                      <p className="text-[10px] font-bold uppercase text-grass">{s.totalScore}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </AppShell>
  );
}
