export type YesNo = "yes" | "no" | null;
export type MissDirection = "left" | "right" | "ob" | null;

export interface HoleEntry {
  hole: number;
  par: 3 | 4 | 5;
  score: number;
  putts: 0 | 1 | 2 | 3 | null;
  fairway: YesNo; // only meaningful for par 4/5
  fairwayMiss: MissDirection; // only when fairway === "no"
  gir: YesNo;
  girMiss: MissDirection; // only when gir === "no"
  penalties: number;
}

export interface Round {
  id: string;
  course: string;
  date: string; // ISO
  holes: HoleEntry[]; // length 18
  finished: boolean;
}

export const DEFAULT_PARS_9: Array<3 | 4 | 5> = [4, 4, 3, 5, 4, 4, 3, 4, 5];

export const DEFAULT_PARS: Array<3 | 4 | 5> = [
  4, 4, 3, 5, 4, 4, 3, 4, 5,
  4, 3, 4, 5, 4, 4, 3, 4, 5,
];

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // fallback for non-secure HTTP contexts
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function makeRound(course: string, holes: 9 | 18 = 18): Round {
  const pars = holes === 9 ? DEFAULT_PARS_9 : DEFAULT_PARS;
  return {
    id: generateId(),
    course: course.trim() || "Untitled Course",
    date: new Date().toISOString(),
    finished: false,
    holes: pars.map((par, i) => ({
      hole: i + 1,
      par,
      score: par,
      putts: null,
      fairway: null,
      fairwayMiss: null,
      gir: null,
      girMiss: null,
      penalties: 0,
    })),
  };
}