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
      <AppShell compact>
        <div className="flex flex-col items-center py-20 text-center">
          <p className="font-display text-3xl uppercase">No Active Round</p>
          <p className="mt-2 text-[15px] text-navy/50">Start a new round from the home screen.</p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-6 rounded-2xl bg-grass px-8 py-3.5 text-[13px] font-semibold text-paper shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Back Home
          </button>
        </div>
      </AppShell>
    );
  }

  const current = round.holes[holeIdx];
  const stats   = computeStats(round);

  function patch(update: Partial<HoleEntry>) {
    if (!round) return;
    const next: Round = {
      ...round,
      holes: round.holes.map((h, i) => (i === holeIdx ? { ...h, ...update } : h)),
    };
    setRound(next);
  }

  function next()   { if (holeIdx < round!.holes.length - 1) setHoleIdx(holeIdx + 1); }
  function prev()   { if (holeIdx > 0) setHoleIdx(holeIdx - 1); }
  function finish() {
    if (!round) return;
    const finished: Round = { ...round, finished: true };
    pushHistory(finished);
    setRound(null);
    sessionStorage.setItem("kilcard:last-finished", JSON.stringify(finished));
    navigate({ to: "/summary", search: { id: null } });
  }

  const isLast = holeIdx === round.holes.length - 1;

  return (
    <AppShell fullHeight compact>
      <section className="flex h-full flex-col gap-2 py-2 animate-reveal">

        {/* Course banner */}
        <div className="shrink-0 flex items-center justify-between rounded-2xl bg-navy px-5 py-3.5 text-paper shadow-sm">
          <div className="min-w-0">
            <p className="font-display text-xl leading-none tracking-wide truncate">{round.course}</p>
            <p className="mt-1 font-mono text-[11px] text-paper/45">
              {stats.holesPlayed}/{round.holes.length} holes
              {stats.holesPlayed > 0 ? ` · ${formatToPar(stats.toPar)} thru ${stats.holesPlayed}` : ""}
            </p>
          </div>
          <button
            onClick={finish}
            className="ml-3 shrink-0 rounded-2xl bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-paper/80 transition-colors hover:bg-white/20 touch-manipulation"
          >
            Finish
          </button>
        </div>

        {/* Hole strip */}
        <div className="shrink-0">
          <HoleStrip holes={round.holes} current={holeIdx} onSelect={setHoleIdx} />
        </div>

        {/* Main hole card */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-3xl bg-navy px-5 py-4 text-paper shadow-sm">

          {/* Hole number + Par */}
          <div className="mb-5 flex items-center justify-between">
            <p className="font-display text-4xl leading-none tracking-wide">
              Hole {String(current.hole).padStart(2, "0")}
            </p>
            <span className="rounded-full bg-grass px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest shadow-sm">
              Par {current.par}
            </span>
          </div>

          {/* Score stepper */}
          <div className="mb-5 flex flex-col items-center">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-paper/50">
              Score
            </p>
            <div className="flex items-center gap-7">
              <button
                onClick={() => patch({ score: Math.max(1, current.score - 1) })}
                className="grid size-14 place-items-center rounded-full bg-white/10 text-3xl font-light transition-colors hover:bg-white/20 touch-manipulation"
                aria-label="Decrease score"
              >
                −
              </button>
              <span className="font-display text-8xl leading-none">{current.score}</span>
              <button
                onClick={() => patch({ score: Math.min(15, current.score + 1) })}
                className="grid size-14 place-items-center rounded-full bg-white/10 text-3xl font-light transition-colors hover:bg-white/20 touch-manipulation"
                aria-label="Increase score"
              >
                +
              </button>
            </div>
            <p className={`mt-2 text-[11px] font-bold uppercase tracking-widest ${scoreLabelColor(current.score, current.par)}`}>
              {scoreLabel(current.score, current.par)}
            </p>
          </div>

          {/* Putts */}
          <Row label="Putts">
            <div className="flex gap-1.5">
              {([0, 1, 2, 3] as const).map((n) => {
                const selected = current.putts === n;
                return (
                  <button
                    key={n}
                    onClick={() => patch({ putts: n as HoleEntry["putts"] })}
                    className={
                      "grid size-12 place-items-center text-[13px] font-bold transition-all rounded-2xl touch-manipulation " +
                      (selected ? "bg-grass text-paper shadow-sm" : "bg-white/10 hover:bg-white/20")
                    }
                  >
                    {n === 3 ? "3+" : n}
                  </button>
                );
              })}
            </div>
          </Row>

          {/* Fairway (par 4+) */}
          {current.par > 3 && (
            <Row label="Fairway Hit">
              <div className="flex flex-col items-end gap-2">
                <YesNoToggle
                  value={current.fairway}
                  onChange={(v) => patch({ fairway: v, fairwayMiss: v !== "no" ? null : current.fairwayMiss })}
                />
                {current.fairway === "no" && (
                  <MissDirectionPicker
                    value={current.fairwayMiss}
                    onChange={(v) => patch({ fairwayMiss: v })}
                  />
                )}
              </div>
            </Row>
          )}

          {/* GIR */}
          <Row label={<span className="text-grass">GIR</span>}>
            <div className="flex flex-col items-end gap-2">
              <YesNoToggle
                value={current.gir}
                onChange={(v) => patch({ gir: v, girMiss: v !== "no" ? null : current.girMiss })}
              />
              {current.gir === "no" && (
                <MissDirectionPicker
                  value={current.girMiss}
                  onChange={(v) => patch({ girMiss: v })}
                />
              )}
            </div>
          </Row>

          {/* Penalties */}
          <Row label="Penalties" last>
            <div className="flex items-center gap-4">
              <button
                onClick={() => patch({ penalties: Math.max(0, current.penalties - 1) })}
                className="grid size-10 place-items-center rounded-full bg-white/10 text-lg font-light hover:bg-white/20 touch-manipulation"
              >
                −
              </button>
              <span className="w-4 text-center font-mono text-[15px] font-semibold">
                {current.penalties}
              </span>
              <button
                onClick={() => patch({ penalties: Math.min(9, current.penalties + 1) })}
                className="grid size-10 place-items-center rounded-full bg-white/10 text-lg font-light hover:bg-white/20 touch-manipulation"
              >
                +
              </button>
            </div>
          </Row>
        </div>

        {/* Prev / Next nav */}
        <div className="shrink-0 grid grid-cols-3 gap-2">
          <button
            onClick={prev}
            disabled={holeIdx === 0}
            className="rounded-2xl border border-navy/15 bg-white py-4 text-[12px] font-semibold text-navy/60 shadow-sm transition-all disabled:opacity-30 hover:bg-navy/5 active:scale-[0.98] touch-manipulation"
          >
            ← Prev
          </button>
          <button
            onClick={isLast ? finish : next}
            className="col-span-2 rounded-2xl bg-grass py-4 text-[13px] font-semibold text-paper shadow-sm transition-all hover:shadow-md active:scale-[0.98] touch-manipulation"
          >
            {isLast ? "Finish Round" : "Next Hole →"}
          </button>
        </div>

      </section>
    </AppShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
    <div className={
      "flex items-center justify-between py-3.5 " +
      (last ? "" : "border-b border-white/10")
    }>
      <span className="text-[12px] font-bold uppercase tracking-widest text-paper/70">{label}</span>
      {children}
    </div>
  );
}

function YesNoToggle({ value, onChange }: { value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <div className="flex rounded-2xl bg-white/10 p-1">
      {(["yes", "no"] as const).map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(active ? null : opt)}
            className={
              "px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all rounded-xl touch-manipulation " +
              (active ? "bg-paper text-navy shadow-sm" : "text-paper/40 hover:text-paper/70")
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function MissDirectionPicker({ value, onChange }: { value: MissDirection; onChange: (v: MissDirection) => void }) {
  return (
    <div className="flex gap-1.5">
      {(["left", "right", "ob"] as const).map((dir) => {
        const active = value === dir;
        return (
          <button
            key={dir}
            onClick={() => onChange(active ? null : dir)}
            className={
              "px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl touch-manipulation " +
              (active ? "bg-paper text-navy shadow-sm" : "bg-white/10 text-paper/40 hover:text-paper/70")
            }
          >
            {dir === "ob" ? "O.B." : dir}
          </button>
        );
      })}
    </div>
  );
}

function HoleStrip({ holes, current, onSelect }: {
  holes: HoleEntry[];
  current: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex gap-1.5">
        {holes.map((h, i) => {
          const played = isPlayed(h);
          const active = i === current;
          return (
            <button
              key={h.hole}
              onClick={() => onSelect(i)}
              className={
                "flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-xl font-mono transition-all touch-manipulation " +
                (active
                  ? "bg-navy text-paper ring-2 ring-navy shadow-sm"
                  : played
                  ? "bg-grass/20 text-navy"
                  : "bg-white text-navy/40 ring-1 ring-navy/10")
              }
            >
              <span className="text-[9px] font-bold opacity-60">{h.hole}</span>
              <span className="text-[12px] font-bold">{played ? h.score : "·"}</span>
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

function scoreLabelColor(score: number, par: number): string {
  const diff = score - par;
  if (score === 1 || diff <= -2) return "text-grass";
  if (diff === -1) return "text-grass";
  if (diff === 0) return "text-paper/50";
  if (diff === 1) return "text-amber-400";
  return "text-red-400";
}
