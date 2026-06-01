const KEY = "kilcard:anthropic-key";

export function getAnthropicKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) ?? "";
}

export function saveAnthropicKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    window.localStorage.setItem(KEY, key.trim());
  } else {
    window.localStorage.removeItem(KEY);
  }
}
