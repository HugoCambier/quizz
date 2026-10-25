import type { z } from "zod";

/**
 * The persistence port. Every repository reads and writes through it, so the
 * browser storage of today can become a remote backend without touching the
 * domain or the UI.
 */
export interface KeyValueStore {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
}

/** `localStorage` (or any Web Storage); a blocked storage reads as empty. */
export function browserStore(storage?: Storage): KeyValueStore {
  const target = (): Storage | undefined => {
    try {
      return storage ?? window.localStorage;
    } catch {
      return undefined;
    }
  };
  return {
    get: (key) => {
      try {
        return target()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    set: (key, value) => {
      try {
        target()?.setItem(key, value);
      } catch {
        // Quota or private mode: the app keeps working in memory.
      }
    },
    remove: (key) => {
      try {
        target()?.removeItem(key);
      } catch {
        // Same as `set`.
      }
    },
  };
}

export function memoryStore(): KeyValueStore {
  const values = new Map<string, string>();
  return {
    get: (key) => values.get(key) ?? null,
    set: (key, value) => values.set(key, value),
    remove: (key) => values.delete(key),
  };
}

/** The parsed value under `key`, or `fallback` when absent or no longer valid. */
export function readJson<T>(
  store: KeyValueStore,
  key: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  fallback: T,
): T {
  const raw = store.get(key);
  if (raw === null) return fallback;
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(store: KeyValueStore, key: string, value: unknown) {
  store.set(key, JSON.stringify(value));
}
