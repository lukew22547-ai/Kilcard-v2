export type YesNo = "yes" | "no" | null;

export interface HoleEntry {
  hole: number;
  par: 3 | 4 | 5;
  score: number;
  putts: 0 | 1 | 2 | 3 | null;
  fairway: YesNo; // only meaningful for par 4/5
  gir: YesNo;
  penalties: number;
}

export interface Round {
  id: string;
  course: string;
  date: string; // ISO
  holes: HoleEntry[]; // length 18
  finished: boolean;
}

export const DEFAULT_PARS: Array<3 | 4 | 5> = [
  4, 4, 3, 5, 4, 4, 3, 4, 5,
  4, 3, 4, 5, 4, 4, 3, 4, 5,
];

export function makeRound(course: string): Round {
  return {
    id: crypto.randomUUID(),
    course: course.trim() || "Untitled Course",
    date: new Date().toISOString(),
    finished: false,
    holes: DEFAULT_PARS.map((par, i) => ({
      hole: i + 1,
      par,
      score: par,
      putts: null,
      fairway: null,
      gir: null,
      penalties: 0,
    })),
  };
}