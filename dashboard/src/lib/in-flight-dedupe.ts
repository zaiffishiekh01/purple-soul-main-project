/**
 * Coalesces identical in-flight async work into a single network request.
 * Safe for idempotent reads only. Clears the entry after settle (success or failure).
 */
const inflight = new Map<string, Promise<unknown>>();

export function dedupeInFlight<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const pending = factory().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, pending);
  return pending;
}
