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
  upAndDownPct: number; // 0..1
  upAndDownAttempts: number;
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
  // Up & down: missed green but still made par or better
  const upAndDownMade = girMissed.filter((h) => h.score <= h.par).length;
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
    upAndDownPct: girMissed.length ? upAndDownMade / girMissed.length : 0,
    upAndDownAttempts: girMissed.length,
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
  upAndDown: 0.40,
};

export function generateInsights(stats: RoundStats): Insight[] {
  if (stats.holesPlayed < 3) {
    return [{ tone: "neutral", title: "Keep logging", body: "Play a few more holes to unlock personalized insights." }];
  }

  const gaps: Array<{ key: string; gap: number; insight: Insight }> = [];

  // ── Putting ──────────────────────────────────────────────────────────────
  const puttGap = stats.avgPutts - BENCH.avgPutts;
  if (puttGap > 0.05) {
    gaps.push({
      key: "putting",
      gap: puttGap * 2,
      insight: {
        tone: "focus",
        title: "Putting is costing you strokes",
        body: `Averaging ${stats.avgPutts.toFixed(2)} putts per hole. Spend your next practice session on lag putting from 25–40 feet to cut three-putts.`,
      },
    });
  }

  // ── GIR ──────────────────────────────────────────────────────────────────
  const girGap = BENCH.girPct - stats.girPct;
  if (girGap > 0.05) {
    gaps.push({
      key: "approach",
      gap: girGap,
      insight: {
        tone: "focus",
        title: "Approach play needs work",
        body: `Only ${Math.round(stats.girPct * 100)}% greens in regulation. Dial in your wedge distances from 100–140 yards.`,
      },
    });
  }

  // ── Driving ───────────────────────────────────────────────────────────────
  const fwGap = BENCH.fairwayPct - stats.fairwayHitPct;
  if (stats.fairwayAttempts >= 3 && fwGap > 0.05) {
    gaps.push({
      key: "driving",
      gap: fwGap,
      insight: {
        tone: "focus",
        title: "Off the tee inconsistency",
        body: `Fairways hit at ${Math.round(stats.fairwayHitPct * 100)}%. Try a three-quarter swing with your driver to keep the ball in play.`,
      },
    });
  }

  // ── Fairway miss direction ────────────────────────────────────────────────
  const totalFwMiss = stats.fairwayMissLeft + stats.fairwayMissRight + stats.fairwayMissOB;
  if (totalFwMiss >= 2) {
    const dominantLeft = stats.fairwayMissLeft > stats.fairwayMissRight && stats.fairwayMissLeft > stats.fairwayMissOB;
    const dominantRight = stats.fairwayMissRight > stats.fairwayMissLeft && stats.fairwayMissRight > stats.fairwayMissOB;
    const dominantOB = stats.fairwayMissOB >= 2;

    if (dominantLeft) {
      gaps.push({
        key: "fwy-left",
        gap: 0.45,
        insight: {
          tone: "focus",
          title: `Pulling driver left (${stats.fairwayMissLeft}/${totalFwMiss} misses)`,
          body: "A consistent left miss usually means an over-the-top path or early release. Focus on keeping your trail elbow tucked and swinging out toward right field.",
        },
      });
    } else if (dominantRight) {
      gaps.push({
        key: "fwy-right",
        gap: 0.45,
        insight: {
          tone: "focus",
          title: `Pushing driver right (${stats.fairwayMissRight}/${totalFwMiss} misses)`,
          body: "A right miss off the tee often means an open face at impact. Check your grip — try rotating your hands slightly clockwise and focus on releasing the club through the ball.",
        },
      });
    } else if (dominantOB) {
      gaps.push({
        key: "fwy-ob",
        gap: 0.5,
        insight: {
          tone: "focus",
          title: `${stats.fairwayMissOB} shots out of bounds`,
          body: "OB strokes are the most expensive in golf. Play a hybrid or long iron off the tee on tight holes — keeping it in play always beats the extra distance.",
        },
      });
    }
  }

  // ── GIR miss direction ────────────────────────────────────────────────────
  const totalGirMiss = stats.girMissLeft + stats.girMissRight + stats.girMissOB;
  if (totalGirMiss >= 2) {
    const dominantLeft = stats.girMissLeft > stats.girMissRight && stats.girMissLeft > stats.girMissOB;
    const dominantRight = stats.girMissRight > stats.girMissLeft && stats.girMissRight > stats.girMissOB;

    if (dominantLeft) {
      gaps.push({
        key: "gir-left",
        gap: 0.4,
        insight: {
          tone: "focus",
          title: `Missing greens left (${stats.girMissLeft}/${totalGirMiss} misses)`,
          body: "A pull on approach shots is often a sign of an open stance or ball positioned too far forward. Check your alignment and try starting the ball at the right edge of the flag.",
        },
      });
    } else if (dominantRight) {
      gaps.push({
        key: "gir-right",
        gap: 0.4,
        insight: {
          tone: "focus",
          title: `Missing greens right (${stats.girMissRight}/${totalGirMiss} misses)`,
          body: "Pushing approach shots right often means you're holding the face open through impact. Practice keeping your lead wrist flat and rotating your body through the shot.",
        },
      });
    }
  }

  // ── Up & down ─────────────────────────────────────────────────────────────
  if (stats.upAndDownAttempts >= 3) {
    const udGap = BENCH.upAndDown - stats.upAndDownPct;
    if (udGap > 0.1) {
      gaps.push({
        key: "updown",
        gap: udGap,
        insight: {
          tone: "focus",
          title: "Short game costing you pars",
          body: `Only ${Math.round(stats.upAndDownPct * 100)}% up & down from ${stats.upAndDownAttempts} attempts. Spend practice time on chip-and-run shots from within 30 yards.`,
        },
      });
    }
  }

  gaps.sort((a, b) => b.gap - a.gap);
  const focus = gaps.slice(0, 3).map((g) => g.insight);

  // ── Wins ──────────────────────────────────────────────────────────────────
  const wins: Insight[] = [];
  if (stats.avgPutts > 0 && stats.avgPutts <= BENCH.avgPutts) {
    wins.push({ tone: "win", title: "Sharp on the greens", body: `Averaging ${stats.avgPutts.toFixed(2)} putts per hole — quality flatstick work.` });
  }
  if (stats.fairwayAttempts >= 3 && stats.fairwayHitPct >= BENCH.fairwayPct) {
    wins.push({ tone: "win", title: "Driver is dialed", body: `${Math.round(stats.fairwayHitPct * 100)}% fairways hit. Keep that tee shot tempo.` });
  }
  if (stats.girPct >= BENCH.girPct) {
    wins.push({ tone: "win", title: "Hitting greens", body: `${Math.round(stats.girPct * 100)}% GIR — your iron play is paying off.` });
  }
  if (stats.upAndDownAttempts >= 3 && stats.upAndDownPct >= BENCH.upAndDown) {
    wins.push({ tone: "win", title: "Clutch short game", body: `${Math.round(stats.upAndDownPct * 100)}% up & down — you're saving par when it counts.` });
  }
  if (totalFwMiss >= 2 && stats.fairwayMissLeft === 0 && stats.fairwayMissRight === 0) {
    wins.push({ tone: "win", title: "Keeping it in play", body: "No significant directional miss pattern off the tee — great course management." });
  }

  const out = [...focus, ...wins].slice(0, 4);
  if (out.length === 0) {
    out.push({ tone: "neutral", title: "Solid, balanced round", body: "No major weakness today. Pick one stat and push it higher next round." });
  }
  return out;
}

export function formatToPar(toPar: number): string {
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}
