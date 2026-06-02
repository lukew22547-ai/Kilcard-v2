const KEY = "kilcard:onboarded";

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(KEY) === "true";
}

export function markOnboarded(): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, "true");
  }
}
