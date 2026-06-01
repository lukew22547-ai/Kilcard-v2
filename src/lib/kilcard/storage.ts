import { useEffect, useState, useCallback } from "react";
import type { Round } from "./types";

const ACTIVE_KEY = "kilcard:active-round";
const HISTORY_KEY = "kilcard:history";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("kilcard:change"));
}

export function getActiveRound(): Round | null {
  return read<Round | null>(ACTIVE_KEY, null);
}

export function setActiveRound(r: Round | null) {
  if (r) write(ACTIVE_KEY, r);
  else if (typeof window !== "undefined") window.localStorage.removeItem(ACTIVE_KEY);
  emit();
}

export function getHistory(): Round[] {
  return read<Round[]>(HISTORY_KEY, []);
}

export function pushHistory(r: Round) {
  const list = getHistory();
  list.unshift(r);
  write(HISTORY_KEY, list.slice(0, 50));
  emit();
}

export function useActiveRound() {
  const [round, setRound] = useState<Round | null>(null);
  useEffect(() => {
    setRound(getActiveRound());
    const handler = () => setRound(getActiveRound());
    window.addEventListener("kilcard:change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("kilcard:change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  const update = useCallback((next: Round | null) => {
    setActiveRound(next);
    setRound(next);
  }, []);
  return [round, update] as const;
}

export function useHistory() {
  const [history, setHistory] = useState<Round[]>([]);
  useEffect(() => {
    setHistory(getHistory());
    const handler = () => setHistory(getHistory());
    window.addEventListener("kilcard:change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("kilcard:change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return history;
}