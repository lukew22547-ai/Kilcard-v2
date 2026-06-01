import type { Round, HoleEntry } from "./types";

export interface RoundStats {
  played: HoleEntry[];
  holesPlayed: number;
  totalScore: number;
  totalPar: number;
  toPar: number;
  totalPutts: number;
  avgPutts: number;
  fairwayHitPct: number; // 0..1
  fairwayAttempts: number;
  fairwayMissLeft: number;
  fairwayMissRight: number;
  fairwayMissOB: number;
  girPct: number; // 0..1
  girMissLeft: number;
  girMissRight: number;
  girMissOB: number;
  penalties: number;
}

export function isPlayed(h: HoleEntry) {
  return h.score !== h.par || h.penalties > 0 || h.putts !== null || h.fairway !== null || h.gir !== null;
}

export function computeStats(round: Round): RoundStats {
  const played = round.holes.filter(isPlayed);
  const totalScore = played.reduce((s, h) => s + h.score, 0);
  const totalPar = played.reduce((s, h) => s + h.par, 0);
  const puttsHoles = played.filter((h) => h.putts !== null);
  const totalPutts = puttsHoles.reduce((s, h) => s + (h.putts ?? 0), 0);
  const fwAttempts = played.filter((h) => h.par > 3);
  const fwHits = fwAttempts.filter((h) => h.fairway === "yes").length;
  const fwMissed = fwAttempts.filter((h) => h.fairway === "no");
  const girHoles = played.filter((h) => h.gir !== null);
  const girHits = girHoles.filter((h) => h.gir === "yes").length;
  const girMissed = girHoles.filter((h) => h.gir === "no");
  const penalties = played.reduce((s, h) => s + h.penalties, 0);

  return {
    played,
    holesPlayed: played.length,
    totalScore,
    totalPar,
    toPar: totalScore - totalPar,
    totalPutts,
    avgPutts: puttsHoles.length ? totalPutts / puttsHoles.length : 0,
    fairwayHitPct: fwAttempts.length ? fwHits / fwAttempts.length : 0,
    fairwayAttempts: fwAttempts.length,
    fairwayMissLeft: fwMissed.filter((h) => h.fairwayMiss === "left").length,
    fairwayMissRight: fwMissed.filter((h) => h.fairwayMiss === "right").length,
    fairwayMissOB: fwMissed.filter((h) => h.fairwayMiss === "ob").length,
    girPct: girHoles.length ? girHits / girHoles.length : 0,
    girMissLeft: girMissed.filter((h) => h.girMiss === "left").length,
    girMissRight: girMissed.filter((h) => h.girMiss === "right").length,
    girMissOB: girMissed.filter((h) => h.girMiss === "ob").length,
    penalties,
  };
}

export interface Insight {
  tone: "focus" | "win" | "neutral";
  title: string;
  body: string;
}

// Benchmarks roughly aligned to a ~10 handicap target.
const BENCH = {
  avgPutts: 1.9,
  girPct: 0.45,
  fairwayPct: 0.55,
};

export function generateInsights(stats: RoundStats): Insight[] {
  if (stats.holesPlayed < 3) {
    return [
      {
        tone: "neutral",
        title: "Keep logging",
        body: "Play a few more holes to unlock personalized insights.",
      },
    ];
  }

  const gaps: Array<{ key: string; gap: number; insight: Insight }> = [];

  const puttGap = stats.avgPutts - BENCH.avgPutts;
  if (puttGap > 0.05) {
    gaps.push({
      key: "putting",
      gap: puttGap * 2,
      insight: {
        tone: "focus",
        title: "Putting is costing you strokes",
        body: `You're averaging ${stats.avgPutts.toFixed(2)} putts per hole. Spend your next practice block on lag putting from 25–40 feet.`,
      },
    });
  }

  const girGap = BENCH.girPct - stats.girPct;
  if (girGap > 0.05) {
    gaps.push({
      key: "approach",
      gap: girGap,
      insight: {
        tone: "focus",
        title: "Approach play needs work",
        body: `Only ${Math.round(stats.girPct * 100)}% greens in regulation. Dial in wedge distances from 100–140 yards.`,
      },
    });
  }

  const fwGap = BENCH.fairwayPct - stats.fairwayHitPct;
  if (stats.fairwayAttempts >= 3 && fwGap > 0.05) {
    gaps.push({
      key: "driving",
      gap: fwGap,
      insight: {
        tone: "focus",
        title: "Off the tee inconsistency",
        body: `Fairways hit at ${Math.round(stats.fairwayHitPct * 100)}%. Try a three-quarter swing with your driver to find the short grass.`,
      },
    });
  }

  gaps.sort((a, b) => b.gap - a.gap);
  const focus = gaps.slice(0, 2).map((g) => g.insight);

  const wins: Insight[] = [];
  if (stats.avgPutts > 0 && stats.avgPutts <= BENCH.avgPutts) {
    wins.push({
      tone: "win",
      title: "Sharp on the greens",
      body: `Averaging ${stats.avgPutts.toFixed(2)} putts per hole — that's quality flatstick work.`,
    });
  }
  if (stats.fairwayAttempts >= 3 && stats.fairwayHitPct >= BENCH.fairwayPct) {
    wins.push({
      tone: "win",
      title: "Driver is dialed",
      body: `${Math.round(stats.fairwayHitPct * 100)}% fairways hit. Keep that tee shot tempo.`,
    });
  }
  if (stats.girPct >= BENCH.girPct) {
    wins.push({
      tone: "win",
      title: "Hitting greens",
      body: `${Math.round(stats.girPct * 100)}% GIR — your iron play is paying off.`,
    });
  }

  const out = [...focus, ...wins].slice(0, 3);
  if (out.length === 0) {
    out.push({
      tone: "neutral",
      title: "Solid, balanced round",
      body: "No major weakness today. Pick one stat and push it higher next round.",
    });
  }
  return out;
}

export function formatToPar(toPar: number): string {
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}