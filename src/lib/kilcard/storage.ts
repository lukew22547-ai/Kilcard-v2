import { useEffect, useRef, useState, useCallback } from "react";
import {
  doc, collection, query, orderBy, limit,
  onSnapshot, setDoc, deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import type { Round } from "./types";

// ── Guest data expiry ─────────────────────────────────────────────────────
// Guest rounds sit in localStorage forever unless we clean them up.
// On every app load we check the last-active timestamp and wipe guest
// data if the user hasn't opened the app in GUEST_EXPIRY_DAYS days.

const GUEST_EXPIRY_DAYS = 30;
const GUEST_LAST_ACTIVE_KEY = "kilcard:guest-last-active";

export function touchGuestLastActive() {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_LAST_ACTIVE_KEY, Date.now().toString());
}

export function clearExpiredGuestData() {
  if (typeof window === "undefined") return;
  const isGuest = localStorage.getItem("kilcard:guest") === "true";
  if (!isGuest) return;

  const lastActive = parseInt(localStorage.getItem(GUEST_LAST_ACTIVE_KEY) ?? "0", 10);
  const expiryMs   = GUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  if (lastActive === 0 || Date.now() - lastActive > expiryMs) {
    // Wipe all guest data
    localStorage.removeItem("kilcard:active-round:guest");
    localStorage.removeItem("kilcard:history:guest");
    localStorage.removeItem("kilcard:guest");
    localStorage.removeItem(GUEST_LAST_ACTIVE_KEY);
    localStorage.removeItem("kilcard:guest-last-active");
  }
}

// ── Local storage helpers ──────────────────────────────────────────────────

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

function removeLocal(key: string) {
  if (typeof window !== "undefined") window.localStorage.removeItem(key);
}

function emitLocal() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("kilcard:change"));
}

// ── Firestore paths ────────────────────────────────────────────────────────

const activeRef  = (uid: string) => doc(db, "users", uid, "data", "activeRound");
const roundsCol  = (uid: string) => collection(db, "users", uid, "rounds");
const roundRef   = (uid: string, id: string) => doc(db, "users", uid, "rounds", id);

// ── Auth mode ──────────────────────────────────────────────────────────────
// "auth:{uid}" | "guest" | "pending"

type Mode = string; // "auth:{uid}" | "guest" | "pending"

function useMode(): Mode {
  const [mode, setMode] = useState<Mode>("pending");
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setMode(`auth:${user.uid}`);
      } else {
        const isGuest = typeof window !== "undefined" && localStorage.getItem("kilcard:guest") === "true";
        setMode(isGuest ? "guest" : "pending");
      }
    });
    return unsub;
  }, []);
  return mode;
}

function parseMode(mode: Mode): { type: "auth"; uid: string } | { type: "guest" } | { type: "pending" } {
  if (mode.startsWith("auth:")) return { type: "auth", uid: mode.slice(5) };
  if (mode === "guest") return { type: "guest" };
  return { type: "pending" };
}

// ── useActiveRound ─────────────────────────────────────────────────────────

export function useActiveRound() {
  const mode    = useMode();
  const parsed  = parseMode(mode);
  const [round, setRound] = useState<Round | null>(null);
  const modeRef = useRef(parsed);
  useEffect(() => { modeRef.current = parsed; }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (parsed.type === "pending") { setRound(null); return; }

    if (parsed.type === "guest") {
      const key = "kilcard:active-round:guest";
      const load = () => setRound(readLocal<Round | null>(key, null));
      load();
      window.addEventListener("kilcard:change", load);
      window.addEventListener("storage", load);
      return () => {
        window.removeEventListener("kilcard:change", load);
        window.removeEventListener("storage", load);
      };
    }

    // Firestore — real-time listener
    const unsub = onSnapshot(activeRef(parsed.uid), (snap) => {
      setRound(snap.exists() ? (snap.data() as Round) : null);
    });
    return unsub;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback((next: Round | null) => {
    const m = modeRef.current;
    setRound(next); // optimistic

    if (m.type === "guest") {
      const key = "kilcard:active-round:guest";
      if (next) writeLocal(key, next); else removeLocal(key);
      emitLocal();
      return;
    }

    if (m.type === "auth") {
      if (next) setDoc(activeRef(m.uid), next).catch(console.error);
      else      deleteDoc(activeRef(m.uid)).catch(console.error);
    }
  }, []);

  return [round, update] as const;
}

// ── useHistory ─────────────────────────────────────────────────────────────

export function useHistory() {
  const mode   = useMode();
  const parsed = parseMode(mode);
  const [history, setHistory] = useState<Round[]>([]);

  useEffect(() => {
    if (parsed.type === "pending") { setHistory([]); return; }

    if (parsed.type === "guest") {
      const key = "kilcard:history:guest";
      const load = () => setHistory(readLocal<Round[]>(key, []));
      load();
      window.addEventListener("kilcard:change", load);
      return () => window.removeEventListener("kilcard:change", load);
    }

    // Firestore — real-time ordered by date
    const q    = query(roundsCol(parsed.uid), orderBy("date", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => d.data() as Round));
    });
    return unsub;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return history;
}

// ── pushHistory ────────────────────────────────────────────────────────────

export function pushHistory(r: Round): void {
  const user = auth.currentUser;

  if (user) {
    // Fire-and-forget — Firestore queues writes offline if needed
    setDoc(roundRef(user.uid, r.id), r).catch(console.error);
    return;
  }

  // Guest: namespaced localStorage
  const key  = "kilcard:history:guest";
  const list = readLocal<Round[]>(key, []);
  list.unshift(r);
  writeLocal(key, list.slice(0, 50));
  emitLocal();
}

// ── Legacy non-hook accessors (summary page fallback) ─────────────────────

export function getHistory(): Round[] {
  const user = auth.currentUser;
  if (!user) return readLocal<Round[]>("kilcard:history:guest", []);
  return []; // for auth users, use useHistory() hook instead
}

export function getActiveRound(): Round | null {
  return readLocal<Round | null>("kilcard:active-round:guest", null);
}

export function setActiveRound(r: Round | null) {
  if (r) writeLocal("kilcard:active-round:guest", r);
  else removeLocal("kilcard:active-round:guest");
  emitLocal();
}
