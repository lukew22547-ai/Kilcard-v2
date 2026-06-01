import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/kilcard/AppShell";
import { pushHistory, useActiveRound } from "@/lib/kilcard/storage";
import type { HoleEntry, MissDirection, Round, YesNo } from "@/lib/kilcard/types";
import { computeStats, formatToPar, isPlayed } from "@/lib/kilcard/stats";

export const Route = createFileRoute("/round")({
  head: () => ({
    meta: [
      { title: "Round in Progress — Kilcard" },
      { name: "description", content: "Log each hole in seconds: putts, fairway hit, GIR, and score." },
      { property: "og:title", content: "Round in Progress — Kilcard" },
      { property: "og:description", content: "Log each hole in seconds: putts, fairway hit, GIR, and score." },
    ],
  }),
  component: RoundPage,
});

function RoundPage() {
  const navigate = useNavigate();
  const [round, setRound] = useActiveRound();
  const [holeIdx, setHoleIdx] = useState(0);

  useEffect(() => {
    if (round === null) return;
    const firstUnplayed = round.holes.findIndex(
      (h) => h.putts === null && h.fairway === null && h.gir === null
    );
    setHoleIdx(firstUnplayed === -1 ? 0 : firstUnplayed);
  }, [round?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!round) {
    return (
      <AppShell>
        <div className="py-16 text-center">
          <p className="font-display text-3xl">No Active Round</p>
          <p className="mt-2 text-sm text-navy/60">Start a new round from the home screen.</p>
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

  const current = round.holes[holeIdx];
  const stats = computeStats(round);

  function patch(update: Partial<HoleEntry>) {
    if (!round) return;
    const next: Round = {
      ...round,
      holes: round.holes.map((h, i) => (i === holeIdx ? { ...h, ...update } : h)),
    };
    setRound(next);
  }

  function next() {
    if (!round) return;
    if (holeIdx < round.holes.length - 1) setHoleIdx(holeIdx + 1);
  }
  function prev() {
    if (holeIdx > 0) setHoleIdx(holeIdx - 1);
  }

  function finish() {
    if (!round) return;
    const finished: Round = { ...round, finished: true };
    pushHistory(finished);
    setRound(null);
    sessionStorage.setItem("kilcard:last-finished", JSON.stringify(finished));
    navigate({ to: "/summary", search: { id: null } });
  }

  return (
    <AppShell fullHeight>
      <section className="animate-reveal flex flex-col h-full gap-3 py-4">
        {/* Top stats bubble */}
        <div className="shrink-0 bg-navy rounded-2xl px-5 py-3 text-paper flex items-center justify-between">
          <div>
            <p className="font-display text-2xl tracking-wide leading-none">{round.course}</p>
            <p className="mt-1 font-mono text-xs text-paper/50">
              {stats.holesPlayed}/{round.holes.length} holes
              {stats.holesPlayed > 0 ? ` · ${formatToPar(stats.toPar)} thru ${stats.holesPlayed}` : ""}
            </p>
          </div>
          <button
            onClick={finish}
            className="rounded-xl border border-white/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-paper/70 hover:bg-white/10 touch-manipulation"
          >
            Finish
          </button>
        </div>

        <div className="shrink-0">
          <HoleStrip
            holes={round.holes}
            current={holeIdx}
            onSelect={setHoleIdx}
          />
        </div>

        {/* Hole card */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-navy p-7 text-paper rounded-3xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="font-display text-3xl tracking-wide">
              Hole {String(current.hole).padStart(2, "0")}
            </div>
            <div className="bg-grass px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full">
              Par {current.par}
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest">Par</span>
            <div className="flex gap-1">
              {([3, 4, 5] as const).map((p) => {
                const selected = current.par === p;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      const delta = p - current.par;
                      patch({
                        par: p,
                        score: Math.max(1, current.score + delta),
                        // par 3 has no fairway concept
                        fairway: p === 3 ? null : current.fairway,
                      });
                    }}
                    className={
                      "grid size-11 place-items-center text-[11px] font-bold transition-colors rounded-xl touch-manipulation " +
                      (selected ? "bg-grass text-paper" : "bg-white/5 hover:bg-white/15")
                    }
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-10 flex flex-col items-center">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">
              Score
            </p>
            <div className="flex items-center gap-8">
              <button
                onClick={() => patch({ score: Math.max(1, current.score - 1) })}
                className="grid size-14 place-items-center rounded-full border border-white/20 text-2xl font-light transition-colors hover:bg-white/10 touch-manipulation"
                aria-label="Decrease score"
              >
                −
              </button>
              <span className="font-display text-8xl leading-none">{current.score}</span>
              <button
                onClick={() => patch({ score: Math.min(15, current.score + 1) })}
                className="grid size-14 place-items-center rounded-full border border-white/20 text-2xl font-light transition-colors hover:bg-white/10 touch-manipulation"
                aria-label="Increase score"
              >
                +
              </button>
            </div>
            <p className="mt-2 font-mono text-xs opacity-50">
              {scoreLabel(current.score, current.par)}
            </p>
          </div>

          <Row label="Putts">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((n) => {
                const selected = current.putts === n;
                return (
                  <button
                    key={n}
                    onClick={() => patch({ putts: n as HoleEntry["putts"] })}
                    className={
                      "grid size-11 place-items-center text-[11px] font-bold transition-colors rounded-xl touch-manipulation " +
                      (selected ? "bg-grass text-paper" : "bg-white/5 hover:bg-white/15")
                    }
                  >
                    {n === 3 ? "3+" : n}
                  </button>
                );
              })}
            </div>
          </Row>

          {current.par > 3 && (
            <div className="border-b border-white/10 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest">Fairway Hit</span>
                <YesNoToggle
                  value={current.fairway}
                  onChange={(v) => patch({ fairway: v, fairwayMiss: v !== "no" ? null : current.fairwayMiss })}
                />
              </div>
              {current.fairway === "no" && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest opacity-50">Miss</span>
                  <MissDirectionPicker
                    value={current.fairwayMiss}
                    onChange={(v) => patch({ fairwayMiss: v })}
                  />
                </div>
              )}
            </div>
          )}

          <div className="border-b border-white/10 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-grass">GIR</span>
              <YesNoToggle
                value={current.gir}
                onChange={(v) => patch({ gir: v, girMiss: v !== "no" ? null : current.girMiss })}
              />
            </div>
            {current.gir === "no" && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest opacity-50">Miss</span>
                <MissDirectionPicker
                  value={current.girMiss}
                  onChange={(v) => patch({ girMiss: v })}
                />
              </div>
            )}
          </div>

          <Row label="Penalties" last>
            <div className="flex items-center gap-3">
              <button
                onClick={() => patch({ penalties: Math.max(0, current.penalties - 1) })}
                className="grid size-10 place-items-center rounded-xl border border-white/20 text-sm font-light hover:bg-white/10 touch-manipulation"
              >
                −
              </button>
              <span className="font-mono text-sm">{current.penalties}</span>
              <button
                onClick={() => patch({ penalties: Math.min(9, current.penalties + 1) })}
                className="grid size-10 place-items-center rounded-xl border border-white/20 text-sm font-light hover:bg-white/10 touch-manipulation"
              >
                +
              </button>
            </div>
          </Row>
        </div>

        <div className="shrink-0 grid grid-cols-3 gap-2">
          <button
            onClick={prev}
            disabled={holeIdx === 0}
            className="border border-navy/15 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-navy/70 disabled:opacity-30 hover:bg-navy/5 rounded-2xl touch-manipulation"
          >
            ← Prev
          </button>
          {holeIdx === round.holes.length - 1 ? (
            <button
              onClick={finish}
              className="col-span-2 bg-grass py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-paper hover:bg-navy rounded-2xl touch-manipulation"
            >
              Finish Round
            </button>
          ) : (
            <button
              onClick={next}
              className="col-span-2 bg-grass py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-paper hover:bg-navy rounded-2xl touch-manipulation"
            >
              Next Hole →
            </button>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Row({
  label,
  children,
  last,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center justify-between py-3 " +
        (last ? "" : "border-b border-white/10")
      }
    >
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      {children}
    </div>
  );
}

function YesNoToggle({
  value,
  onChange,
}: {
  value: YesNo;
  onChange: (v: YesNo) => void;
}) {
  return (
    <div className="flex bg-white/5 p-1 rounded-xl overflow-hidden">
      {(["yes", "no"] as const).map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(active ? null : opt)}
            className={
              "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-lg touch-manipulation " +
              (active ? "bg-paper text-navy" : "opacity-40 hover:opacity-80")
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function MissDirectionPicker({
  value,
  onChange,
}: {
  value: MissDirection;
  onChange: (v: MissDirection) => void;
}) {
  return (
    <div className="flex gap-1">
      {(["left", "right", "ob"] as const).map((dir) => {
        const active = value === dir;
        return (
          <button
            key={dir}
            onClick={() => onChange(active ? null : dir)}
            className={
              "px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-lg touch-manipulation " +
              (active ? "bg-paper text-navy" : "bg-white/5 opacity-40 hover:opacity-80")
            }
          >
            {dir === "ob" ? "O.B." : dir}
          </button>
        );
      })}
    </div>
  );
}

function HoleStrip({
  holes,
  current,
  onSelect,
}: {
  holes: HoleEntry[];
  current: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <div className="flex gap-1">
        {holes.map((h, i) => {
          const played = isPlayed(h);
          const active = i === current;
          return (
            <button
              key={h.hole}
              onClick={() => onSelect(i)}
              className={
                "flex h-12 w-9 shrink-0 flex-col items-center justify-center font-mono text-[10px] transition-colors rounded-xl " +
                (active
                  ? "bg-navy text-paper"
                  : played
                  ? "bg-grass/20 text-navy"
                  : "bg-white text-navy/40 ring-1 ring-navy/10")
              }
            >
              <span className="text-[9px] font-bold opacity-60">{h.hole}</span>
              <span className="text-[11px]">{played ? h.score : "·"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function scoreLabel(score: number, par: number): string {
  const diff = score - par;
  if (score === 1) return "ACE";
  if (diff <= -3) return "ALBATROSS";
  if (diff === -2) return "EAGLE";
  if (diff === -1) return "BIRDIE";
  if (diff === 0) return "PAR";
  if (diff === 1) return "BOGEY";
  if (diff === 2) return "DOUBLE";
  return `+${diff}`;
}