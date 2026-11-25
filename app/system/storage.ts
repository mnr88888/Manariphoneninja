export const STORE_CHANGE_EVENT = 'simulator-store-change';

export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Persist first, then tell mounted apps to reload the exact same data. */
export function writeStore<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_CHANGE_EVENT, { detail: { key } }));
    return true;
  } catch {
    return false;
  }
}

export function makeMessageId(prefix = 'sim'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
