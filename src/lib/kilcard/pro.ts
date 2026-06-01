const PRO_KEY = "kilcard:pro";

export function getProStatus(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PRO_KEY) === "true";
}

export function activatePro(): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PRO_KEY, "true");
  }
}
